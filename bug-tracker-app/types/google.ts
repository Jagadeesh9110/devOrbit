// types/google.ts

export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string; // Made select_by optional to match LoginForm.tsx version and avoid conflict
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            ux_mode?: string;
          }) => void;
          renderButton?: (
            // Made renderButton optional as it's not in LoginForm's original type
            element: HTMLElement,
            options: {
              type: string;
              theme: string;
              size: string;
              text: string;
              shape: string;
              width?: number; // Made width optional
              logo_alignment?: string; // Made logo_alignment optional
            }
          ) => void;
          prompt?: (momentListener?: (notification: any) => void) => void; // Made prompt optional
        };
      };
    };
  }
}
