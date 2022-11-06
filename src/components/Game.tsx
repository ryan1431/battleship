import './Game.css';
import { Menu, SemanticCOLORS } from 'semantic-ui-react';
import { useState } from 'react';
import { Board } from './Board';
import { ActionBar } from './ActionBar';
import { Upgrades } from './Upgrades';
import { Arsenal } from './Arsenal';
import { Setup } from './setup/Setup';
import { Rules } from './Rules';

type Tab = 'arsenal' | 'upgrades' | 'rules' | 'setup';

const tabColors: Record<Tab, SemanticCOLORS> = {
  arsenal: 'blue',
  upgrades: 'green',
  rules: 'yellow',
  setup: 'orange',
};

export const Game = () => {
  const [tab, setTab] = useState<Tab>('upgrades');

  const createTabProps = (t: Tab) => {
    const active = tab === t;
    return {
      active,
      color: active ? tabColors[t] : 'black',
      onClick: () => setTab(t),
    };
  };

  return (
    <div className="main">
      <Board />

      <div className="main-content">
        <Menu inverted widths={4} style={{ borderRadius: 0, marginTop: 0, position: 'sticky', top: 0, zIndex: 1000 }}>
          <Menu.Item {...createTabProps('arsenal')}>Arsenal</Menu.Item>
          <Menu.Item {...createTabProps('upgrades')}>Upgrades</Menu.Item>
          <Menu.Item {...createTabProps('rules')}>Rules</Menu.Item>
          <Menu.Item {...createTabProps('setup')}>Setup</Menu.Item>
        </Menu>

        {tab === 'upgrades' && <Upgrades />}
        {tab === 'arsenal' && <Arsenal />}
        {tab === 'setup' && <Setup />}
        {tab === 'rules' && <Rules />}
      </div>

      <ActionBar />
    </div>
  );
};
