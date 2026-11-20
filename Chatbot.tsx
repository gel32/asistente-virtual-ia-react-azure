import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeBubble] = useState(true);
  
  // Función auxiliar para obtener la hora en formato HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  // Mensaje inicial con timestamp
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'bot', 
      text: '¡Hola! 👋 Soy Emma, asistente virtual de INGE!. ¿En qué te puedo ayudar hoy?',
      timestamp: getCurrentTime()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue(''); 

    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: userText,
      timestamp: getCurrentTime()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Endpoint configurado mediante variable de entorno para proteger la firma SAS
      const LOGIC_APP_URL = import.meta.env.VITE_AZURE_LOGIC_APP_URL || 'https://<TU_LOGIC_APP_TRIGGER_URL>';

      const response = await fetch(LOGIC_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserMsg)
      });

      if (response.ok) {
        const data = await response.json(); 
        
        const botReply: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: data.reply,
          timestamp: getCurrentTime()
        };
        setMessages(prev => [...prev, botReply]);
      } else {
        throw new Error('La respuesta de la red no fue exitosa');
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: 'Hubo un problema de conexión con Azure. Por favor, intenta de nuevo más tarde.',
        timestamp: getCurrentTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferToExecutive = () => {
    type WhatsAppExecutive = {
      name: string;
      phoneNumber: string;
      weight: number;
    };

    // Datos de ejemplo para demostración del algoritmo de asignación ponderada
    const EXECUTIVES: WhatsAppExecutive[] = [
      { name: 'Ejecutivo 1', phoneNumber: '+56 9 0000 0001', weight: 25 },
      { name: 'Ejecutivo 2', phoneNumber: '+56 9 0000 0002', weight: 25 },
      { name: 'Ejecutivo 3', phoneNumber: '+56 9 0000 0003', weight: 25 },
      { name: 'Ejecutivo 4', phoneNumber: '+56 9 0000 0004', weight: 25 }
    ];

    const pickExecutiveByWeight = (executives: WhatsAppExecutive[]): WhatsAppExecutive => {
      const validExecutives = executives.filter((executive) => executive.weight > 0);
      
      if (validExecutives.length === 0) {
        return executives[0];
      }

      const totalWeight = validExecutives.reduce((sum, executive) => sum + executive.weight, 0);
      const randomPoint = Math.random() * totalWeight;
      let cumulativeWeight = 0;

      for (const executive of validExecutives) {
        cumulativeWeight += executive.weight;
        if (randomPoint <= cumulativeWeight) {
          return executive;
        }
      }
      return validExecutives[0];
    };

    const assignedExecutive = pickExecutiveByWeight(EXECUTIVES);
    const cleanPhone = assignedExecutive.phoneNumber.replace(/[^0-9]/g, '');

    const textMessage = encodeURIComponent(
      `Hola! Me gustaria tener mas informacion sobre [escribe el producto que te interesa aqui] el rut de la empresa es [escribe el rut de tu empresa] (Ejecutivo asignado: ${assignedExecutive.name})`
    );

    window.open(`https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${textMessage}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end">
      
      {/* GLOBO DE BIENVENIDA */}
      {!isOpen && showWelcomeBubble && (
        <div 
          onClick={toggleChat}
          className="mr-3 mb-2 px-4 py-3 bg-white rounded-2xl rounded-br-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 cursor-pointer animate-fade-in-up transition-transform hover:-translate-y-1"
        >
          <span className="text-gray-700 text-sm font-medium">¡Hola! ¿En qué puedo ayudarte?</span>
        </div>
      )}

      {/* Ventana del Chatbot */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[28rem] animate-fade-in-up">
          
          {/* Encabezado */}
          <div className="bg-[#1e40af] text-white px-4 py-4 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm">Asistente Virtual INGE!</h3>
            </div>
            <button 
              onClick={toggleChat} 
              className="text-white hover:text-gray-200 transition-colors focus:outline-none"
              aria-label="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de mensajes (Historial) */}
          <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
            <div className="text-center text-xs text-gray-400 my-2">Hoy</div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 pt-2.5 pb-1 text-sm max-w-[85%] shadow-sm flex flex-col ${
                  msg.sender === 'user' 
                    ? 'bg-[#1e40af] text-white rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl' 
                    : 'bg-white border border-gray-200 text-gray-700 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl'
                }`}>
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                  <span className={`text-[10px] self-end mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* ÁREA DE ACCIONES: BOTÓN HABLAR CON EJECUTIVO */}
          <div className="px-3 pt-2 bg-gray-50 flex justify-center">
             <button 
                onClick={handleTransferToExecutive}
                className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#25D366" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                Hablar con un Ejecutivo
             </button>
          </div>

          {/* Formulario */}
          <div className="border-t border-gray-100 p-3 bg-white mt-1">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu mensaje..."} 
                className="w-full text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#1e40af] text-white p-2.5 rounded-full hover:bg-blue-800 disabled:bg-gray-300 disabled:scale-100 hover:scale-105 transition-all duration-200 focus:outline-none flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <button 
        onClick={toggleChat}
        className={`${isOpen ? 'hidden' : 'flex'} items-center justify-center w-14 h-14 bg-[#1e40af] text-white rounded-full shadow-lg hover:bg-blue-800 hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 ml-auto`}
        aria-label="Abrir chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
}