import React, { createContext, useState, useEffect } from "react"

interface ModeContextType {

    enabled: boolean
    setEnabled: (value: boolean) => void

}

export const ModeContext = createContext<ModeContextType | undefined>(undefined)

interface ModeProviderProps {
    children: React.ReactNode
}

export const ModeProvider = ({ children }: ModeProviderProps) => {

    const rawValue = localStorage.getItem("enabled");
    const parsedValue: boolean = rawValue !== null ? JSON.parse(rawValue) : false;
    const [enabled, setEnabled] = useState<boolean>(parsedValue);

    useEffect(() => {
        localStorage.setItem("enabled", JSON.stringify(enabled));
    }, [enabled]);

    return (
        <ModeContext.Provider value={{ enabled, setEnabled }}>
            {children}
        </ModeContext.Provider>
    )
}