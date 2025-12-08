import { Component, OnInit, inject } from '@angular/core';
import { ChatbotService } from 'src/app/services/chatbot.service';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: false // En Ionic/Angular tradicional suele ser false, ajusta si usas standalone components
})
export class ChatbotPage implements OnInit {
  
  // Inyectamos el servicio de forma pública para usarlo en el HTML
  public chatbotService = inject(ChatbotService);

  public messages: ChatMessage[] = [];
  public userInput: string = '';
  public isGenerating: boolean = false;

  constructor() { }

  ngOnInit() {
    // Al entrar a la página, intentamos cargar el modelo si no está listo
    // Esto disparará la descarga la primera vez
    this.chatbotService.initModel().catch(err => {
      console.error("Error iniciando el modelo en la vista:", err);
      // Aquí podrías mostrar un Toast o alerta de error al usuario
    });
  }

  async sendMessage() {
    // Validamos que haya texto y que no esté pensando ya
    if (!this.userInput.trim() || this.isGenerating) return;

    const userText = this.userInput.trim();
    
    // 1. Agregamos el mensaje del usuario a la lista visual
    this.messages.push({ role: 'user', content: userText });
    
    // Limpiamos el input
    this.userInput = '';
    this.isGenerating = true;

    try {
      // 2. Enviamos al servicio y esperamos respuesta
      const response = await this.chatbotService.generateResponse(userText);
      
      // 3. Agregamos la respuesta del bot
      this.messages.push({ role: 'bot', content: response });
    
    } catch (error) {
      this.messages.push({ role: 'bot', content: "Lo siento, tuve un problema interno." });
    } finally {
      this.isGenerating = false;
      // Aquí podríamos agregar un scroll automático hacia abajo si fuera necesario
    }
  }
}