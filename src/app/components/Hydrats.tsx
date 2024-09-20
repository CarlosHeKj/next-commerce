'use client'

import { ReactNode, useState, useEffect } from "react";

export default function Hydrate({ children}: { children:ReactNode}) {
    const [isMonted, setIsMonted] = useState(false);

    useEffect(()=>{
        setIsMonted(true);
    }, []);
    return isMonted ? <>{children}</> : <span>Carregando...</span>
}