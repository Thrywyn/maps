import "./common/style.scss";
import * as Schema from "./common/JSONSchema";
import { Category } from "./common/Category";
import { Map } from "./common/Map";

window.onload = async () => {
  const map = Map.create("la", 3280, 205, {
    center: [0, 0],
    zoom: 2,
  });

  function addJson(categories: Schema.Category[]): void {
    categories.forEach((c) => map.addCategory(Category.fromJSON(c, "la")));
  }

  try {
    const pins = await fetch(`${import.meta.env.BASE_URL}la/markers/pins.json`);
    addJson(await pins.json());
  } catch (ex) {
    /* fail gracefully */
  }

  await map.initializeWikiConnector();
};
