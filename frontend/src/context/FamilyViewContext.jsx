import { createContext, useContext, useState } from "react";

const FamilyViewContext = createContext();

export const FamilyViewProvider = ({children}) => {
  const [viewingFamily, setViewingFamily] = useState(null);

  return (
    <FamilyViewContext.Provider value={{ viewingFamily, setViewingFamily }}>
      {children}
    </FamilyViewContext.Provider>
  );
};

export const useFamilyView = () => useContext(FamilyViewContext);
