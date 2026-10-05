import type { ModuleSeed } from './types';
import { introducaoRedes } from './modules/01-introducao-redes';
import { modeloOsi } from './modules/02-modelo-osi';
import { tcpIp } from './modules/03-tcp-ip';
import { ipv4 } from './modules/04-ipv4';
import { subnetting } from './modules/05-subnetting';
import { macEArp } from './modules/06-mac-e-arp';
import { tcpUdp } from './modules/07-tcp-udp';
import { portasDeRede } from './modules/08-portas-de-rede';
import { dns } from './modules/09-dns';
import { dhcp } from './modules/10-dhcp';
import { httpHttps } from './modules/11-http-https';
import { ssh } from './modules/12-ssh';
import { icmp } from './modules/13-icmp';
import { switchModule } from './modules/14-switch';
import { router } from './modules/15-router';
import { natPat } from './modules/16-nat-pat';
import { firewall } from './modules/17-firewall';
import { vlan } from './modules/18-vlan';
import { vpn } from './modules/19-vpn';
import { desafioFinal } from './modules/20-desafio-final';

export { glossary } from './glossary';
export type * from './types';

/** Ordem oficial da trilha: a posição no array define o order_index do módulo. */
export const modules: ModuleSeed[] = [
  introducaoRedes,
  modeloOsi,
  tcpIp,
  ipv4,
  subnetting,
  macEArp,
  tcpUdp,
  portasDeRede,
  dns,
  dhcp,
  httpHttps,
  ssh,
  icmp,
  switchModule,
  router,
  natPat,
  firewall,
  vlan,
  vpn,
  desafioFinal,
];

/**
 * Incremente sempre que alterar o conteúdo em lib/content. O banco SQLite
 * compara este número com o PRAGMA user_version e refaz o seed automaticamente.
 */
export const CONTENT_VERSION = 2;
