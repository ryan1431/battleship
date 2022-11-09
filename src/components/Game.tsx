import './Game.css';
import clsx from 'clsx';
import { Menu, SemanticCOLORS } from 'semantic-ui-react';
import { useState } from 'react';
import { Board } from './Board';
import { ActionBar } from './ActionBar';
import { Upgrades } from './Upgrades';
import { Arsenal } from './Arsenal';
import { Players } from './players/Players';
import { Rules } from './Rules';
import { useOrientation } from '../hooks/useOrientation';

type Tab = 'arsenal' | 'upgrades' | 'rules' | 'players';

const tabColors: Record<Tab, SemanticCOLORS> = {
  arsenal: 'blue',
  upgrades: 'green',
  rules: 'yellow',
  players: 'purple',
};

export const Game = () => {
  const [tab, setTab] = useState<Tab>('upgrades');
  const orientation = useOrientation();

  const createTabProps = (t: Tab) => {
    const active = tab === t;
    return {
      active,
      color: active ? tabColors[t] : 'black',
      onClick: () => setTab(t),
    };
  };

  return (
    <div className={clsx('main', { landscape: orientation === 'landscape' })}>
      <Board />

      <div className="main-content">
        <Menu inverted widths={4} style={{ borderRadius: 0, marginTop: 0, position: 'sticky', top: 0, zIndex: 1000 }}>
          <Menu.Item {...createTabProps('arsenal')}>Arsenal</Menu.Item>
          <Menu.Item {...createTabProps('upgrades')}>Upgrades</Menu.Item>
          <Menu.Item {...createTabProps('rules')}>Rules</Menu.Item>
          <Menu.Item {...createTabProps('players')}>Players</Menu.Item>
        </Menu>

        {tab === 'upgrades' && <Upgrades />}
        {tab === 'arsenal' && <Arsenal />}
        {tab === 'rules' && <Rules />}
        {tab === 'players' && <Players />}

        <ActionBar />
      </div>
    </div>
  );
};
