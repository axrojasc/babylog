import { Injectable, signal } from '@angular/core';
import { CreateMLCEngine, MLCEngine, InitProgressCallback } from '@mlc-ai/web-llm';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private engine: MLCEngine | null = null;

  public isLoading = signal(false);
  public loadProgress = signal('');
  public isModelLoaded = signal(false);

  // CAMBIO 1: Usamos Llama-3.2-1B. Es mucho más inteligente en español que TinyLlama
  // y pesa casi lo mismo.
  private selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  // CAMBIO 2: Prompt más estricto para evitar alucinaciones
  private systemPrompt = `Eres un pediatra experto y empático de la aplicación BabyLog.
  Tu objetivo es dar consejos claros, breves y seguros sobre bebés.
  Reglas:
  1. Responde SIEMPRE en español neutro.
  2. Si preguntan "¿cuándo dar agua?", la respuesta estándar es: "Generalmente a partir de los 6 meses, cuando inician la alimentación complementaria. Antes de eso, la leche materna o fórmula es suficiente."
  3. NO inventes términos médicos extraños.
  4. Si es una emergencia, manda al usuario al hospital.`;

  constructor() { }

  async initModel() {
    if (this.isModelLoaded()) return;

    this.isLoading.set(true);
    this.loadProgress.set('Cargando nuevo cerebro (Llama 3.2)...');

    const initProgressCallback: InitProgressCallback = (report) => {
      this.loadProgress.set(report.text);
    };

    try {
      this.engine = await CreateMLCEngine(
        this.selectedModel,
        { initProgressCallback }
      );

      this.isModelLoaded.set(true);
      this.isLoading.set(false);
      this.loadProgress.set('¡Listo!');

    } catch (error) {
      console.error("Error cargando modelo:", error);
      this.isLoading.set(false);
      this.loadProgress.set('Error al cargar.');
      throw error;
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    if (!this.engine) throw new Error("Modelo no cargado.");

    const messages = [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: userMessage }
    ];

    try {
      const reply = await this.engine.chat.completions.create({
        messages: messages as any,
        // CAMBIO 3: Temperatura baja (0.1) para respuestas precisas y factuales.
        // Evita que invente cosas raras.
        temperature: 0.1, 
        max_tokens: 512,
      });

      return reply.choices[0].message.content || "No pude generar respuesta.";
    } catch (error) {
      console.error("Error respuesta:", error);
      return "Ocurrió un error procesando tu consulta.";
    }
  }
}