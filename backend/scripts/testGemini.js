import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      // Filter for models that have 'embedContent' in their supported methods
      const embedModels = data.models.filter(m => 
        m.supportedMethodNames && m.supportedMethodNames.includes("generateContent") 
        // Note: Sometimes the API refers to embeddings differently, 
        // so let's just list all models to be safe.
      );
      
      console.log("Available Models:");
      console.table(data.models.map(m => ({ 
        name: m.name, 
        description: m.description 
      })));
    } else {
      console.log("Response:", data);
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

listModels();