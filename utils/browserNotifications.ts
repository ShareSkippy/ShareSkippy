// ============================================================================
// 7. BROWSER NOTIFICATION UTILITY
// ============================================================================

/**
 * @path /utils/browserNotifications.ts
 */

export class BrowserNotifications {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  static async showNotification(
    title: string,
    options: {
      body: string;
      icon?: string;
      tag?: string;
      data?: { url?: string; [key: string]: unknown };
    }
  ): Promise<void> {
    const permission = await this.requestPermission();

    if (permission === 'granted') {
      const notification = new Notification(title, {
        ...options,
        badge: '/icon.png',
        vibrate: [200, 100, 200],
      } as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };
    }
  }
}
