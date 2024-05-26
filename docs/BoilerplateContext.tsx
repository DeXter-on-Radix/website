/**
 * This is a boilerplate on how to initialize a page wide state store
 * all states are created and updated using reacts native useState() API.
 *
 * To do list:
 * -> Replace all occurencies of "Boilerplate" with your page components name
 * -> Define your states. You will need to add them in all 3 instances where
 *    TODO_DEFINE_STATES is commented. If you need complex types or enums you can
 *    define them in the section TODO_DEFINE_INTERFACES
 *
 * Original idea taken from this guide and modified for typescript:
 * => https://dev.to/nazmifeeroz/using-usecontext-and-usestate-hooks-as-a-store-mnm
 */
import React, { useState, createContext, ReactNode, useContext } from "react";

// For better readibility
type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;

// Define the context
const BoilerplateContext = createContext<BoilerplateContextType | null>(null);

// TODO_DEFINE_INTERFACES: Your custom interfaces or enums go here

// TODO_DEFINE_STATES: all state variables of the page must be defined here
interface BoilerplateContextType {
  firstName: [string, StateUpdater<string>];
  lastName: [string, StateUpdater<string>];
  age: [number, StateUpdater<number>];
}

// Define the provider component
export const BoilerplateProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  // TODO_DEFINE_STATES: define all states and their initialization values here
  const [firstName, setFirstName] = useState<string>("John");
  const [lastName, setLastName] = useState<string>("Doe");
  const [age, setAge] = useState<number>(30);

  // TODO_DEFINE_STATES: export all states and state setters as store
  const store: BoilerplateContextType = {
    firstName: [firstName, setFirstName],
    lastName: [lastName, setLastName],
    age: [age, setAge],
  };

  return (
    <BoilerplateContext.Provider value={store}>
      {children}
    </BoilerplateContext.Provider>
  );
};

// Set the display name for the component (for debugging and better DX)
BoilerplateProvider.displayName = "BoilerplateProvider";

// Custom hook to use the Boilerplate context
export const useBoilerplateContext = (): BoilerplateContextType => {
  const context = useContext(BoilerplateContext);
  if (!context) {
    throw new Error("useBoilerplate must be used within a BoilerplateProvider");
  }
  return context;
};
