import { Component } from '@angular/core';
import { HeroSearch } from '../hero-search/hero-search';
import { FeaturedProperties } from '../properties/featured-properties/featured-properties';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSearch, FeaturedProperties, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
