import { Component, Input } from '@angular/core';
import { TableService } from '../../../services/table.service';
import { Table } from '../../../models/table.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SeatListComponent } from "../../seats/seat-list/seat-list.component";

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SeatListComponent],
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
})
export class TableListComponent {
  @Input() restaurantId!: string;
  @Input() tables: Table[] = [];

  loading: boolean = false;

  tableNumber: number = 1;
  seatsCount: number = 4;

  editingTableId: string | null = null;
  editTableNumber: number = 0;

  constructor(
    private tableService: TableService,
    private toastr: ToastrService
  ) {}

  // ✅ Add Table
  addTable() {
    this.tableService
      .addTable(this.restaurantId, this.tableNumber, this.seatsCount)
      .subscribe({
        next: (newTable) => {
          this.tables.push(newTable);
          this.toastr.success('Table added successfully');

          // reset form
          this.tableNumber = 1;
          this.seatsCount = 4;
        },
        error: () => {
          this.toastr.error('Failed to add table');
        },
      });
  }

  // ✅ Start Editing
  startEdit(table: Table) {
    this.editingTableId = table.id;
    this.editTableNumber = table.tableNumber;
  }

  // ✅ Save Update
  saveEdit(tableId: string) {
    this.tableService.updateTable(tableId, this.editTableNumber).subscribe({
      next: (updated) => {
        const index = this.tables.findIndex((t) => t.id === tableId);
        this.tables[index] = updated;

        this.toastr.success('Table updated');
        this.editingTableId = null;
      },
      error: () => {
        this.toastr.error('Failed to update table');
      },
    });
  }

  // ✅ Delete Table
  deleteTable(tableId: string) {
    if (!confirm('Are you sure you want to delete this table?')) return;

    this.tableService.deleteTable(tableId).subscribe({
      next: () => {
        this.tables = this.tables.filter((t) => t.id !== tableId);
        this.toastr.success('Table deleted');
      },
      error: () => {
        this.toastr.error('Failed to delete table');
      },
    });
  }
}
