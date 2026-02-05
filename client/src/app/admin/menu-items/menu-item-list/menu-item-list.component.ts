import { Component } from '@angular/core';
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
  menuItems: MenuItem[] = [];
  loading = false;

  showForm: boolean = false;

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
  // LOAD ALL MENU ITEMS
  // -------------------------------
  loadMenuItems() {
    this.loading = true;
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items.filter(item => !!item); // safety filter
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load menu items');
        this.loading = false;
      },
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageFile = file;
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

    const payload = {
      name: this.name,
      description: this.description,
      price: this.price,
      isAvailable: this.isAvailable,
    };

    if (this.editingItemId) {
      // Update existing item
      this.menuService.updateMenuItem(this.editingItemId, payload, this.imageFile || undefined)
        .subscribe({
          next: (updated) => {
            const index = this.menuItems.findIndex(i => i.id === updated.id);
            if (index !== -1) this.menuItems[index] = updated;
            this.toastr.success('Menu item updated successfully');
            this.resetForm();
            this.showForm = false;
          },
          error: () => this.toastr.error('Failed to update menu item'),
          complete: () => (this.loading = false),
        });
      return;
    }

    // Create new item
    this.menuService.createMenuItem('', payload, this.imageFile || undefined).subscribe({
      next: (created) => {
        this.menuItems.unshift(created);
        this.toastr.success('Menu item added');
        this.resetForm();
        this.showForm = false;
      },
      error: () => this.toastr.error('Failed to add menu item'),
      complete: () => (this.loading = false),
    });
  }

  startEdit(item: MenuItem) {
    this.showForm = true;
    this.editingItemId = item.id;
    this.name = item.name || '';
    this.description = item.description || '';
    this.price = item.price || 0;
    this.isAvailable = !!item.isAvailable;
    this.imagePreview = item.imageUrl || null;
    this.imageFile = null;
  }

  deleteMenuItem(itemId: string) {
    if (!confirm('Delete this menu item?')) return;

    this.menuService.deleteMenuItem(itemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(i => i.id !== itemId);
        this.toastr.success('Menu item deleted');
      },
      error: () => this.toastr.error('Failed to delete menu item'),
    });
  }

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
