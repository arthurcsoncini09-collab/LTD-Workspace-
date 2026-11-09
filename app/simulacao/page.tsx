import { SimulationGame } from '@/components/simulacao/game';

export const metadata = {
  title: 'Simulação: Carreira em TI | NetLearn',
  description: 'Jogo em fases: resolva chamados reais de suporte, redes, segurança, cloud e telecom usando o que aprendeu no NetLearn.',
};

export default function SimulacaoPage() {
  return <SimulationGame />;
}
