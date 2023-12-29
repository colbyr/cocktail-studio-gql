import { mutationField, stringArg } from 'nexus';
import { ZRecipeImport } from './RecipeImport';

export const ImportSharedRecipeMutation = mutationField('importSharedRecipe', {
  description: 'Import recipe a from a cocktailstudio share url',
  type: 'RecipeImport',
  args: {
    recipeUrl: stringArg(),
  },
  resolve: async (_root, { recipeUrl }, { openai }) => {
    if (!recipeUrl.startsWith('https://www.cocktailstudio.app')) {
      throw new Error('Invalid url');
    }
    const pathname = recipeUrl.replace('https://www.cocktailstudio.app', '');
    const uri = decodeURI(pathname);
    const [, type, base64] = uri.split('/');
    if (type !== 'recipe') {
      throw new Error('Invalid url');
    }
    const binString = atob(decodeURIComponent(base64));
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    const jsonString = new TextDecoder().decode(bytes);
    const jsonResult = JSON.parse(jsonString);
    return ZRecipeImport.parse(jsonResult);
  },
});
