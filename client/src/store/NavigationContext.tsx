import { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface NavigationContextType {
  canNavigateToSignUp: boolean;
  setCanNavigateToSignUp: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [canNavigateToSignUp, setCanNavigateToSignUp] = useState(false);

  return (
    <NavigationContext.Provider value={{ canNavigateToSignUp, setCanNavigateToSignUp }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
};
