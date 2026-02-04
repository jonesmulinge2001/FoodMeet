import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../models/restaurant.model';
import { CommonModule } from '@angular/common';
import { TableListComponent } from "../../tables/table-list/table-list.component";
import { FormsModule } from '@angular/forms';
import { MenuListComponent } from "../../menu-items/menu-item-list/menu-item-list.component";

@Component({
  imports: [CommonModule, RouterModule, TableListComponent, FormsModule, MenuListComponent],
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.component.html',
})
export class RestaurantDetailsComponent implements OnInit {
  restaurant!: Restaurant;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.restaurantService.getRestaurantById(id).subscribe({
      next: (data) => {
        this.restaurant = data;
      },
    });
  }
}
