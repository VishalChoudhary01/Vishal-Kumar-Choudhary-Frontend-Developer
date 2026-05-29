import handleContactForm from "@/controllers/contact.controller";

async function POST(request) {
  try {
    const body = await request.json();
    const result = await handleContactForm(body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export default POST