import * as L from "leaflet";
import * as Schema from "./JSONSchema";
import { Map } from "./Map";
import { Marker } from "./Marker";

enum Visibility {
  Off,
  On,
  Default,
}

export class Layer extends L.LayerGroup {
  public icon?: L.Icon;
  public infoSource: string;

  private minZoom = 0;
  private maxZoom = Number.MAX_VALUE;
  private visibility = Visibility.Default;
  private map!: Map; // BUGBUG refactor to avoid having to suppress null checking
  private markers!: Marker[]; // BUGBUG refactor to avoid having to suppress null checking

  private constructor(infoSource: string) {
    super();
    this.infoSource = infoSource;
  }

  public static fromJSON(
    json: Schema.Layer,
    infoSource: string,
    directory: string
  ): Layer {
    const layer = new Layer(infoSource);

    if (json.icon) {
      layer.icon = L.icon({
        iconUrl: `${import.meta.env.BASE_URL}${directory}/icons/${
          json.icon.url
        }`, // TODO find a better way to get directory
        iconSize: [json.icon.width, json.icon.height],
      });
    }

    if (json.minZoom != undefined) {
      layer.minZoom = json.minZoom;
    }
    if (json.maxZoom != undefined) {
      layer.maxZoom = json.maxZoom;
    }

    layer.markers = json.markers.map((m) => Marker.fromJSON(m, layer));

    return layer;
  }

  public addToMap(map: Map): void {
    this.map = map;
    this.updateVisibility();
    map.on("zoom", (_) => this.updateVisibility());

    this.markers.forEach((m) => map.addMarker(m));
  }

  public getIconUrl(): string {
    return (this.icon && this.icon.options.iconUrl) || "";
  }

  public getIconWidth(): number {
    return (this.icon && (<L.PointTuple>this.icon.options.iconSize)[0]) || 0;
  }

  public getMinZoom(): number {
    return this.minZoom;
  }

  public isVisible(): boolean {
    return this.map.hasLayer(this);
  }

  public forceShow(): void {
    this.setVisibility(Visibility.On);
  }

  public forceHide(): void {
    this.setVisibility(Visibility.Off);
  }

  public resetVisibility(): void {
    this.setVisibility(Visibility.Default);
  }

  private setVisibility(visibility: Visibility): void {
    this.visibility = visibility;
    this.updateVisibility();
  }

  private updateVisibility(): void {
    const zoom = this.map.getZoom();
    if (
      this.visibility === Visibility.On ||
      (this.visibility === Visibility.Default &&
        zoom >= this.minZoom &&
        zoom <= this.maxZoom)
    ) {
      this.addTo(this.map);
    } else {
      this.removeFrom(this.map);
    }
  }
}
