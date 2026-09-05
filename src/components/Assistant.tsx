import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';

type Message = { from: 'bot' | 'user'; text: string };

const answers = [
  { terms: ['filhote', 'filhotes', 'ração'], answer: 'Para filhotes, procure uma ração específica para a fase de crescimento. No catálogo, a Origem Filhotes é uma opção. Se houver restrição alimentar, confirme com o veterinário.' },
  { terms: ['promoção', 'promoções', 'oferta'], answer: 'Todos os itens do catálogo exibem o preço atual e o promocional. O valor em verde é o que entra no carrinho.' },
  { terms: ['finalizar', 'pedido', 'pagamento'], answer: 'Abra o carrinho, confira os itens e toque em “Finalizar pedido”. O pagamento será feito no caixa da loja quando você retirar a compra.' },
  { terms: ['remover', 'excluir', 'carrinho'], answer: 'No carrinho, toque no ícone de lixeira ao lado do item que deseja remover.' },
];

function getAnswer(question: string) {
  const normalized = question.toLocaleLowerCase('pt-BR');
  return answers.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.answer
    ?? 'Posso ajudar com rações para filhotes, promoções, carrinho e finalização do pedido. Tente perguntar sobre um desses assuntos.';
}

export function Assistant() {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Oi! Sou a Fifi. O que você quer saber sobre os produtos ou seu pedido?' },
  ]);

  const send = (text = input) => {
    const question = text.trim();
    if (!question) return;
    setMessages((current) => [...current, { from: 'user', text: question }, { from: 'bot', text: getAnswer(question) }]);
    setInput('');
  };

  return (
    <>
      <Pressable accessibilityLabel="Abrir assistente Fifi" onPress={() => setVisible(true)} style={styles.fab}>
        <Text style={styles.fabText}>Fifi</Text>
        <View style={styles.online} />
      </Pressable>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Fifi, sua assistente</Text>
                <Text style={styles.subtitle}>Ajuda rápida sobre produtos e pedidos</Text>
              </View>
              <Pressable accessibilityLabel="Fechar assistente" onPress={() => setVisible(false)} style={styles.close}>
                <Ionicons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.messages}>
              {messages.map((message, index) => (
                <View key={`${message.from}-${index}`} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.message, message.from === 'user' && styles.userMessage]}>{message.text}</Text>
                </View>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
              {['Ração para filhotes', 'Produtos em promoção', 'Como finalizar?'].map((suggestion) => (
                <Pressable key={suggestion} onPress={() => send(suggestion)} style={styles.chip}><Text style={styles.chipText}>{suggestion}</Text></Pressable>
              ))}
            </ScrollView>
            <View style={styles.composer}>
              <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Digite sua dúvida" placeholderTextColor={colors.muted} style={styles.input} />
              <Pressable accessibilityLabel="Enviar pergunta" onPress={() => send()} style={styles.send}><Ionicons name="arrow-up" size={22} color={colors.white} /></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', right: 20, bottom: 24, minWidth: 64, height: 56, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', ...shadow },
  fabText: { color: colors.white, fontFamily: fonts.display, fontSize: 17 },
  online: { position: 'absolute', right: 5, top: 4, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.mango, borderWidth: 2, borderColor: colors.ink },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,33,60,0.35)' },
  sheet: { height: '78%', maxHeight: 680, width: '100%', maxWidth: 680, alignSelf: 'center', backgroundColor: colors.paper, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: colors.sky },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 23 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  close: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  messages: { padding: 18, gap: 10 },
  bubble: { maxWidth: '84%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 17 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: colors.white, borderBottomLeftRadius: 5 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.cobalt, borderBottomRightRadius: 5 },
  message: { color: colors.ink, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  userMessage: { color: colors.white },
  suggestions: { paddingHorizontal: 18, gap: 8, paddingBottom: 10 },
  chip: { height: 38, paddingHorizontal: 13, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, justifyContent: 'center' },
  chipText: { color: colors.cobalt, fontFamily: fonts.semibold, fontSize: 13 },
  composer: { flexDirection: 'row', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
  input: { flex: 1, minHeight: 48, borderRadius: radius.md, backgroundColor: colors.paper, paddingHorizontal: 14, color: colors.ink, fontFamily: fonts.regular, fontSize: 15 },
  send: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.cobalt, alignItems: 'center', justifyContent: 'center' },
});
