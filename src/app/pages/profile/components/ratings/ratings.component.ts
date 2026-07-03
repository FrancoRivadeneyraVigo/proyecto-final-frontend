import { Component, input } from '@angular/core';
import { IReview } from '../../../../shared/models/profile-activity.interface';

@Component({
  selector: 'app-ratings',
  imports: [],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.css',
})
export class RatingsComponent {
  reviews = input<IReview[]>([]);
  loading = input(false);
  error = input<string | null>(null);

  reviewerName(review: IReview): string {
    const fullName = [review.reviewer_name, review.reviewer_surname]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || review.reviewer_username || 'Usuario';
  }

  reviewDate(review: IReview): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(review.created_at));
  }

  stars(review: IReview): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1).filter((star) => star <= review.stars);
  }

  emptyStars(review: IReview): number[] {
    return Array.from({ length: 5 - this.stars(review).length }, (_, index) => index + 1);
  }
}