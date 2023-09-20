/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { ContextWithLoaders } from "./../src/Context"
import type { Ingredient } from "./../src/Ingredient/Ingredient"
import type { Recipe } from "./../src/Recipe/Recipe"
import type { RecipeIngredient } from "./../src/RecipeIngredient/RecipeIngredient"
import type { User } from "./../src/User/UserSchema"
import type { FieldAuthorizeResolver } from "nexus/dist/plugins/fieldAuthorizePlugin"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  RecipeIngredientInput: { // input type
    amount: number; // Float!
    amountScale?: NexusGenEnums['AmountScale'] | null; // AmountScale
    ingredientName: string; // String!
  }
}

export interface NexusGenEnums {
  AmountScale: "dash" | "drop" | "floz" | "g" | "mL" | "oz"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Ingredient: Ingredient;
  LoginResultFailure: { // root type
    reason: string; // String!
  }
  LoginResultSuccess: { // root type
    token: string; // String!
    userId: string; // ID!
  }
  Mutation: {};
  Query: {};
  Recipe: Recipe;
  RecipeIngredient: RecipeIngredient;
  User: User;
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
  LoginResult: NexusGenRootTypes['LoginResultFailure'] | NexusGenRootTypes['LoginResultSuccess'];
}

export type NexusGenRootTypes = NexusGenObjects & NexusGenUnions

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Ingredient: { // field return type
    description: string; // String!
    id: string; // ID!
    name: string; // String!
    recipeIngredients: NexusGenRootTypes['RecipeIngredient'][]; // [RecipeIngredient!]!
    recipes: NexusGenRootTypes['Recipe'][]; // [Recipe!]!
  }
  LoginResultFailure: { // field return type
    reason: string; // String!
  }
  LoginResultSuccess: { // field return type
    token: string; // String!
    userId: string; // ID!
  }
  Mutation: { // field return type
    createRecipe: NexusGenRootTypes['Recipe']; // Recipe!
    deleteRecipes: string[]; // [ID!]!
    login: NexusGenRootTypes['LoginResult']; // LoginResult!
    loginAnonymous: NexusGenRootTypes['LoginResult']; // LoginResult!
    signup: NexusGenRootTypes['LoginResult']; // LoginResult!
    updateRecipe: NexusGenRootTypes['Recipe']; // Recipe!
  }
  Query: { // field return type
    me: NexusGenRootTypes['User']; // User!
  }
  Recipe: { // field return type
    description: string; // String!
    directions: string; // String!
    id: string; // ID!
    isDeleted: boolean; // Boolean!
    name: string; // String!
    recipeIngredients: NexusGenRootTypes['RecipeIngredient'][]; // [RecipeIngredient!]!
    summary: string; // String!
  }
  RecipeIngredient: { // field return type
    amount: number; // Float!
    amountScale: NexusGenEnums['AmountScale'] | null; // AmountScale
    id: string; // ID!
    ingredient: NexusGenRootTypes['Ingredient']; // Ingredient!
    recipe: NexusGenRootTypes['Recipe']; // Recipe!
  }
  User: { // field return type
    email: string | null; // String
    id: string; // ID!
    ingredientById: NexusGenRootTypes['Ingredient'] | null; // Ingredient
    ingredients: NexusGenRootTypes['Ingredient'][]; // [Ingredient!]!
    recipeById: NexusGenRootTypes['Recipe'] | null; // Recipe
    recipes: NexusGenRootTypes['Recipe'][]; // [Recipe!]!
  }
}

export interface NexusGenFieldTypeNames {
  Ingredient: { // field return type name
    description: 'String'
    id: 'ID'
    name: 'String'
    recipeIngredients: 'RecipeIngredient'
    recipes: 'Recipe'
  }
  LoginResultFailure: { // field return type name
    reason: 'String'
  }
  LoginResultSuccess: { // field return type name
    token: 'String'
    userId: 'ID'
  }
  Mutation: { // field return type name
    createRecipe: 'Recipe'
    deleteRecipes: 'ID'
    login: 'LoginResult'
    loginAnonymous: 'LoginResult'
    signup: 'LoginResult'
    updateRecipe: 'Recipe'
  }
  Query: { // field return type name
    me: 'User'
  }
  Recipe: { // field return type name
    description: 'String'
    directions: 'String'
    id: 'ID'
    isDeleted: 'Boolean'
    name: 'String'
    recipeIngredients: 'RecipeIngredient'
    summary: 'String'
  }
  RecipeIngredient: { // field return type name
    amount: 'Float'
    amountScale: 'AmountScale'
    id: 'ID'
    ingredient: 'Ingredient'
    recipe: 'Recipe'
  }
  User: { // field return type name
    email: 'String'
    id: 'ID'
    ingredientById: 'Ingredient'
    ingredients: 'Ingredient'
    recipeById: 'Recipe'
    recipes: 'Recipe'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createRecipe: { // args
      description?: string | null; // String
      directions?: string | null; // String
      name: string; // String!
      recipeIngredients: NexusGenInputs['RecipeIngredientInput'][]; // [RecipeIngredientInput!]!
    }
    deleteRecipes: { // args
      recipeIds: string[]; // [ID!]!
    }
    login: { // args
      email: string; // String!
      password: string; // String!
    }
    signup: { // args
      email: string; // String!
      password: string; // String!
    }
    updateRecipe: { // args
      description?: string | null; // String
      directions?: string | null; // String
      name: string; // String!
      recipeId: string; // ID!
      recipeIngredients: NexusGenInputs['RecipeIngredientInput'][]; // [RecipeIngredientInput!]!
    }
  }
  User: {
    ingredientById: { // args
      ingredientId: string; // ID!
    }
    recipeById: { // args
      recipeId: string; // ID!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  LoginResult: "LoginResultFailure" | "LoginResultSuccess"
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = keyof NexusGenUnions;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "LoginResult";

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: ContextWithLoaders;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
    /**
     * Authorization for an individual field. Returning "true"
     * or "Promise<true>" means the field can be accessed.
     * Returning "false" or "Promise<false>" will respond
     * with a "Not Authorized" error for the field.
     * Returning or throwing an error will also prevent the
     * resolver from executing.
     */
    authorize?: FieldAuthorizeResolver<TypeName, FieldName>
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}