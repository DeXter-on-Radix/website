import { toast } from "react-hot-toast";

/**
 * Wrapper service for 'react-hot-toast' notifications to generate
 * dexter branded toast notifications.
 * https://react-hot-toast.com/
 */
export class Toast {
  static helloWorld() {
    toast.success("hello world");
  }
  static success(message: string) {
    toast.success(message);
  }
}
