import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Restaurant } from '../../../models/restaurant.model';
import { RestaurantService } from '../../../services/restaurant.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
})
export class RestaurantFormComponent implements OnInit {
  restaurantForm!: FormGroup;
  restaurantId: string | null = null;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
    });

    this.restaurantId = this.route.snapshot.paramMap.get('id');
    if (this.restaurantId) {
      this.isEditMode = true;
      this.fetchRestaurant(this.restaurantId);
    }
  }

  fetchRestaurant(id: string): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (restaurant: Restaurant) => {
        this.restaurantForm.patchValue({
          name: restaurant.name,
          location: restaurant.location,
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to fetch restaurant');
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.restaurantForm.invalid) return;

    this.loading = true;
    const formData = this.restaurantForm.value;

    if (this.isEditMode && this.restaurantId) {
      this.restaurantService.updateRestaurant(this.restaurantId, formData).subscribe({
        next: () => {
          this.toastr.success('Restaurant updated successfully');
          this.router.navigate(['/restaurants']);
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to update restaurant');
          this.loading = false;
        },
      });
    } else {
      this.restaurantService.createRestaurant(formData).subscribe({
        next: () => {
          this.toastr.success('Restaurant created successfully');
          this.router.navigate(['/restaurants']);
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to create restaurant');
          this.loading = false;
        },
      });
    }
  }
}
