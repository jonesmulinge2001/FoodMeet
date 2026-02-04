import { Component, Input } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../models/menu-item.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-item-list.component.html',
})
export class MenuListComponent {
  @Input() restaurantId!: string;

  menuItems: MenuItem[] = [];
  loading = false;

  showForm: boolean = false; // <-- form visibility

  // For add/edit form
  editingItemId: string | null = null;
  name: string = '';
  description: string = '';
  price: number = 0;
  isAvailable: boolean = true;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private menuService: MenuService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadMenuItems();
  }

  // -------------------------------
  // LOAD MENU ITEMS
  // -------------------------------
  loadMenuItems() {
    this.menuService.getMenuItems(this.restaurantId).subscribe({
      next: (items) => (this.menuItems = items),
      error: () => this.toastr.error('Failed to load menu items'),
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm(); // reset if hiding
  }

  // -------------------------------
  // SELECT IMAGE
  // -------------------------------
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.imageFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

// -------------------------------
// ADD / UPDATE MENU ITEM
// -------------------------------
saveMenuItem() {
  if (!this.name || this.price <= 0) {
    this.toastr.error('Name and price are required');
    return;
  }

  this.loading = true;

  if (this.editingItemId) {
    this.menuService
      .updateMenuItem(
        this.editingItemId,
        {
          name: this.name,
          description: this.description,
          price: this.price,
          isAvailable: this.isAvailable,
        },
        this.imageFile || undefined
      )
      .subscribe({
        next: (updated) => {
          // ✅ Replace item in array
          const index = this.menuItems.findIndex(
            (item) => item.id === updated.id
          );

          if (index !== -1) {
            this.menuItems[index] = updated;
          }

          this.toastr.success('Menu item updated successfully');

          this.resetForm();
          this.showForm = false;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to update menu item');
        },
        complete: () => (this.loading = false),
      });

    return;
  }

  // -------------------------
  // CREATE NEW ITEM
  // -------------------------
  this.menuService
    .createMenuItem(
      this.restaurantId,
      {
        name: this.name,
        description: this.description,
        price: this.price,
        isAvailable: this.isAvailable,
      },
      this.imageFile || undefined
    )
    .subscribe({
      next: (created) => {
        this.menuItems.unshift(created);

        this.toastr.success('Menu item added');

        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to add menu item');
      },
      complete: () => (this.loading = false),
    });
}


  

  // -------------------------------
  // EDIT MENU ITEM
  // -------------------------------
  startEdit(item: MenuItem) {
    this.showForm = true;
    this.editingItemId = item.id;
    this.name = item.name;
    this.description = item.description || '';
    this.price = item.price;
    this.isAvailable = item.isAvailable;
    this.imagePreview = item.imageUrl || null;
    this.imageFile = null;
  }

  // -------------------------------
  // DELETE MENU ITEM
  // -------------------------------
  deleteMenuItem(itemId: string) {
    if (!confirm('Delete this menu item?')) return;

    this.menuService.deleteMenuItem(itemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter((i) => i.id !== itemId);
        this.toastr.success('Menu item deleted');
      },
      error: () => this.toastr.error('Failed to delete menu item'),
    });
  }

  // -------------------------------
  // RESET FORM
  // -------------------------------
  resetForm() {
    this.editingItemId = null;
    this.name = '';
    this.description = '';
    this.price = 0;
    this.isAvailable = true;
    this.imageFile = null;
    this.imagePreview = null;
  }
}
