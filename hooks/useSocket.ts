import { useEffect, useRef } from "react";

const useSocket = () => {
    const socketCreated = useRef(false);

    useEffect(() => {
        if(!socketCreated.current) {
            const socketInit = async () => {
                const socket = await fetch('/api/socket');
            }

            try{
                socketInit();
                socketCreated.current = true;
            } catch (error) {
                console.error('Failed to initialize socket:', error);
            }
        }
    }, []);
}
 
export default useSocket;