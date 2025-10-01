export enum AppState {
  INACTIVE,
  SELECTING_LANGUAGE,
  ACTIVE,
  ASSISTANCE,
}

export type Language = 'en' | 'ro';

export interface Product {
  name: string;
  image: string;
  description: string;
  brief: string;
}

export interface Recommendation extends Product {}

export type ConversationTurn = {
  speaker: 'user' | 'alex';
  text: string;
};
