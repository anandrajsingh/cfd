export async function getUserBalance() {
    try {
        const res = await fetch("http://localhost:3001/api/v1/asset/balance", {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error?.error || "Failed to fetch balance");
        }

        const data = await res.json();
        return data;

    } catch (err) {
        return err
    }
}