import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeaturedProperties } from "./components/featured-properties/featured-properties";
import { HeroSearch } from "./components/hero-search/hero-search";
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeaturedProperties, HeroSearch, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'realEstate-frontend';
}
