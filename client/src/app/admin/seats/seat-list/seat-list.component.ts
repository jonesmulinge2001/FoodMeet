import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeatService } from '../../../services/seat.service';
import { Seat } from '../../../models/seat.model';

@Component({
  selector: 'app-seat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seat-list.component.html',
})
export class SeatListComponent {
  @Input() tableId!: string;
  @Input() seats: Seat[] = [];

  seatNumber: number | null = null;
  loading = false;

  constructor(private seatService: SeatService) {}

  addSeat() {
    if (!this.seatNumber) return;

    this.loading = true;

    this.seatService.addSeat(this.tableId, this.seatNumber).subscribe({
      next: (newSeat) => {
        this.seats.push(newSeat);
        this.seatNumber = null;
        this.loading = false;
      },
      error: () => {
        alert('Failed to add seat');
        this.loading = false;
      },
    });
  }

  deleteSeat(seatId: string) {
    if (!confirm('Delete this seat?')) return;

    this.seatService.deleteSeat(seatId).subscribe({
      next: () => {
        this.seats = this.seats.filter((s) => s.id !== seatId);
      },
      error: () => {
        alert('Failed to delete seat');
      },
    });
  }
}
