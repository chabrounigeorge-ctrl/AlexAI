import { Type, FunctionDeclaration } from '@google/genai';
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    name: "Brancoveanu XO",
    image: "https://picsum.photos/seed/BrancoveanuXO/800/800",
    description: "A symbol of Romanian elegance, this vinars is aged for at least 7 years. It boasts complex aromas of vanilla, dried fruit, and oak, with a smooth, velvety finish. Perfect for sipping neat or in a classic cocktail.",
    brief: "A complex and elegant vinars with notes of vanilla and oak."
  },
  {
    name: "Alexandrion 7 Stars",
    image: "https://picsum.photos/seed/Alexandrion7/800/800",
    description: "A masterful blend of aged wine distillate and natural extracts. It has a balanced taste with hints of Mediterranean wood and a golden amber color. Ideal for special occasions, enjoyed on its own or with a mixer.",
    brief: "A balanced blend with hints of Mediterranean wood."
  },
  {
    name: "Kreskova Vodka",
    image: "https://picsum.photos/seed/Kreskova/800/800",
    description: "A premium vodka made from the finest neutral grain spirit, five times distilled for exceptional purity. Its clean, crisp taste makes it a versatile base for countless cocktails, from a classic Martini to a Moscow Mule.",
    brief: "A pure and crisp vodka, perfect for cocktails."
  },
  {
    name: "Red Bowler Scotch Whisky",
    image: "https://picsum.photos/seed/RedBowler/800/800",
    description: "This blended Scotch whisky offers a smooth and mellow character. With notes of honey, apple, and a touch of smoke, it's an accessible yet flavorful choice for both new and seasoned whisky drinkers.",
    brief: "A smooth and mellow Scotch with notes of honey and apple."
  },
  {
    name: "Saber Elyzia",
    image: "https://picsum.photos/seed/SaberElyzia/800/800",
    description: "A sophisticated fruit liqueur, perfect as an aperitif or digestif. Its vibrant fruit flavors are balanced by a subtle sweetness, making it a delightful addition to sparkling wine or a refreshing cocktail.",
    brief: "A vibrant and sophisticated fruit liqueur."
  }
];

const productListForPrompt = PRODUCTS.map(p => p.name).join(', ');

const baseSystemInstruction = `You are Alex, a sophisticated, eloquent, and highly knowledgeable connoisseur representing the Alexandrion Group. Your goal is to expertly guide customers to their perfect drink with efficiency and grace. Your vocal delivery should be clear, confident, and at a brisk, professional pace.

Available products: ${productListForPrompt}.

You are an expert in food and drink pairings. If a customer mentions an occasion or a meal (e.g., 'what goes well with steak?'), use that as the primary context for your questions and recommendations.

Interaction Flow:
1. Greet the user concisely and offer your expertise.
2. Ask only one or two essential, insightful questions to swiftly discern their preferences (e.g., taste profile, occasion, meal pairing).
3. Once you have enough information, you MUST call the 'showRecommendations' function with two or three fitting products.
4. For the recommendations, provide a detailed description for the first product. For the second and optional third, provide a brief, single-sentence description.
5. After presenting recommendations, ask a follow-up question like "Do any of these catch your eye?" or "Can I tell you more about one of them?" to keep the conversation going.
6. If a query is unrelated to Alexandrion products or drink selection, politely state you cannot assist with that request and steer the conversation back to your purpose. Do not call for assistance unless the user is aggressive.
`;

export const SYSTEM_INSTRUCTIONS = {
  en: `${baseSystemInstruction}
You must speak only in English. Speak relatively fast but clearly.
When you call 'showRecommendations', use the English descriptions for the products.`,
  ro: `${baseSystemInstruction}
You must speak only in Romanian. Speak relatively fast but clearly.
When you call 'showRecommendations', you must translate the product descriptions to Romanian.`
};

export const RECOMMENDATIONS_FUNCTION_DECLARATION: FunctionDeclaration = {
  name: 'showRecommendations',
  description: 'Displays product recommendations to the customer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recommendations: {
        type: Type.ARRAY,
        description: 'A list of two or three product recommendations.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: `The name of the product. Must be one of: ${productListForPrompt}`
            },
            description: {
              type: Type.STRING,
              description: 'Product description. The first one should be detailed (2-3 sentences), the next ones should be brief (1 sentence).'
            }
          },
          required: ['name', 'description']
        }
      }
    },
    required: ['recommendations']
  }
};
