/**
 * Gemini Imagen 4.0 Image Generator & Enhancer for SOLEFORCE Products
 */
const premiumImageFallbackMap = {
  1: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=800&q=80", // Air Jordan 1 Retro High OG
  2: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", // Air Max 270
  3: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80", // Ultraboost 22
  4: "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?auto=format&fit=crop&w=800&q=80", // Yeezy Boost 350 V2
  5: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80", // RS-X Reinvention
  6: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80", // 990v5
  7: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", // Air Force 1 '07
  8: "https://images.unsplash.com/photo-1512374382149-4337531f29cdc?auto=format&fit=crop&w=800&q=80", // NMD_R1
  9: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80", // Club C 85
  10: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80", // Chuck Taylor All Star High
  11: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80", // ZoomX Vaporfly Next%
  12: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=800&q=80", // Superstar
  13: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80", // Future Rider
  14: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80", // 574 Core
  15: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80", // Blazer Mid '77
  16: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80", // Stan Smith
  17: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80", // React Infinity Run
  18: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", // Suede Classic
  19: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", // Nano X2
  20: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80", // HOVR Phantom 2
  21: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80", // Dunk Low Retro
  22: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80", // Forum Low
  23: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80", // New Balance 327
  24: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", // Cali Sport
  25: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80", // Pegasus 40
  26: "https://images.unsplash.com/photo-1512374382149-4337531f29cdc?auto=format&fit=crop&w=800&q=80", // Gazelle
  27: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=800&q=80", // Classic Leather
  28: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", // Air Zoom Structure 24
  29: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", // Charged Assert 9
  30: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"  // Run Star Motion
};

/**
 * Generate a premium Nike x Apple style studio image using Gemini Imagen 4.0
 * If the key is unpaid or fails, returns a curated high-quality Unsplash image to prevent repetitive visual cards.
 */
async function generateEnhancedImage(productId, brand, name, defaultUrl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(`⚠️ [Gemini] No GEMINI_API_KEY configured. Falling back to premium visual asset.`);
    return premiumImageFallbackMap[productId] || defaultUrl;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
  const prompt = `A premium, clean studio product photograph of a ${brand} ${name} sneaker. Styled in a minimalist, high-contrast Nike x Apple design, soft studio lighting, solid light gray background (#f5f5f7), 1:1 square aspect ratio, sharp focus.`;

  const payload = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1",
      outputMimeType: "image/jpeg"
    }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        console.log(`✨ [Gemini] Successfully generated premium image for ${brand} ${name}.`);
        return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
      }
    }

    const errBody = await res.json().catch(() => ({}));
    console.warn(`⚠️ [Gemini] Imagen 4.0 generation failed (Status ${res.status}): ${errBody.error?.message || 'Unknown'}. Falling back to premium styled visual.`);
  } catch (err) {
    console.error(`⚠️ [Gemini] Network error calling Imagen API: ${err.message}. Falling back to premium styled visual.`);
  }

  // Fallback to high-quality curated visual
  return premiumImageFallbackMap[productId] || defaultUrl;
}

module.exports = {
  generateEnhancedImage,
  premiumImageFallbackMap
};
