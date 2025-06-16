import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
  calculateTimeSincePosted(date: Date | string | undefined): string {
    if (!date) return '';

    const postDate = new Date(date);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - postDate.getTime();

    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(secondsDifference / 60);
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    if (daysDifference > 0) {
      return `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
    } else if (hoursDifference > 0) {
      return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
    } else if (minutesDifference > 0) {
      return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  }
}