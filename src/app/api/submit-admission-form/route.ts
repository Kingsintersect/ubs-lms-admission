// Only required if you're sending large JSON
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Increase to allow larger body
        },
    },
};

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            const data = await req.json();
            console.log("Received JSON:", data);

            // handle and validate data here...

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        if (contentType?.includes("multipart/form-data")) {
            const formData = await req.formData();
            const firstName = formData.get("firstName");
            console.log('firstName', firstName)

            // handle uploaded files or other fields
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response("Unsupported content type", { status: 400 });
    } catch (error) {
        console.error("Error:", error);
        return new Response("Server Error", { status: 500 });
    }
}
