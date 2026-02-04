import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../../../models/restaurant.model';
import { RestaurantService } from '../../../services/restaurant.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
})
export class RestaurantListComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = false;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.loading = true;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  deleteRestaurant(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the restaurant permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.restaurantService.deleteRestaurant(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Restaurant has been deleted.', 'success');
            this.fetchRestaurants();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete restaurant', 'error');
          },
        });
      }
    });
  }
}
