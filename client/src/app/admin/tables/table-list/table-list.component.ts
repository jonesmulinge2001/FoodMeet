import { Component, Input, OnInit } from '@angular/core';
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
export class TableListComponent implements OnInit {
  // Remove restaurantId input since we don't need it anymore
  // @Input() restaurantId!: string;
  
  // Instead of receiving tables as input, load them in ngOnInit
  tables: Table[] = [];
  
  loading: boolean = false;

  tableNumber: number = 1;
  seatsCount: number = 4;

  editingTableId: string | null = null;
  editTableNumber: number = 0;

  constructor(
    private tableService: TableService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadTables();
  }

  // Load all tables
  loadTables() {
    this.loading = true;
    this.tableService.getTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load tables');
        this.loading = false;
      }
    });
  }

  // ✅ Add Table (without restaurantId)
  addTable() {
    this.tableService
      .addTable(this.tableNumber, this.seatsCount) // Removed restaurantId parameter
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