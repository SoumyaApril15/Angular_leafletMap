import { Component } from '@angular/core';
import { GeocodingService } from '../geocoding.service';
import L from 'leaflet';
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Import styles


declare module 'leaflet' {
  namespace control {

    interface Locate extends L.Control {
      addTo(map: L.Map): this;
      start(): this;
      stop(): this;
    }

    function locate(options?: LocateOptions): Locate;
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  map!: L.Map;
  marker!: L.Marker;
  circle!: L.Circle;
  polygon!: L.Polygon;
  latitude: number = 51.505; // Default latitude
  longitude: number = -0.09; // Default longitude
  landmarkName!: string;

  customIcon = L.icon({
    iconUrl: 'assets/icons/markericon.png',  // Path to your custom icon
    iconSize: [38, 38],  // size of the icon
    iconAnchor: [19, 38],  // point of the icon which will correspond to marker's location
    popupAnchor: [0, -38]  // point from which the popup should open relative to the iconAnchor
  });


  constructor(private geocodingService: GeocodingService) { }

  ngOnInit(): void {
    this.initializeMap();
    this.updateLandmarkName(this.latitude, this.longitude);
  }


  initializeMap(): void {
    this.map = L.map('map').setView([this.latitude, this.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    L.control.locate().addTo(this.map);

    // Create circle with the same center as the map's initial view
    this.circle = L.circle([this.latitude, this.longitude], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(this.map);


    this.map.locate({ setView: true, maxZoom: 16 });


    this.map.on('locationfound', (e: any) => {
      this.latitude = e.latitude;
      this.longitude = e.longitude;

      this.marker = L.marker([this.latitude, this.longitude], { icon: this.customIcon }).addTo(this.map)
        .bindPopup('You are here')
        .openPopup();

      this.updateLandmarkName(this.latitude, this.longitude);
    });

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      this.latitude = lat;
      this.longitude = lng;

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }

      this.updateLandmarkName(lat, lng);
    });
  }


  updateLandmarkName(lat: number, lon: number): void {
    this.geocodingService.getLandmarkName(lat, lon).subscribe((data: any) => {
      this.landmarkName = data.display_name;
    });
  }


}
