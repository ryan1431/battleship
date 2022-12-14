import { SetAttackType } from './SetAttackType';
import { GrAdd } from 'react-icons/gr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './AttackDetails.css';
import { itemIcons } from '../../utility/storeIcons';
import { BoardAction } from '../../types/action';
import { useAppSelector } from '../../app/hooks';
import { Button, Checkbox, Header, Menu } from 'semantic-ui-react';
import { Preview } from './Preview';
import { Ship } from '../../types/ship';
import { getInitialHits } from '../../utility/getInitialHits';
import { DirectionalBomb } from '../../types/items';

interface AttackDetailsProps {
  action: BoardAction;
  setAction: React.Dispatch<React.SetStateAction<BoardAction>>;
  coords: string;
  segmentsMap: Map<string, Ship>;
  attacksSet: Set<string>;
}

export type Direction = 'up' | 'right' | 'down' | 'left';

export const AttackDetails = ({ action, setAction, coords, segmentsMap, attacksSet }: AttackDetailsProps) => {
  const users = useAppSelector((s) => s.game.users);

  const [selected, setSelected] = useState<string>(`${action.x}-${action.y}`);
  const [currentUser, setCurrentUser] = useState<number>();
  const bomb = useAppSelector((s) => s.game.store.find((s) => s.type === 'directional') as DirectionalBomb);

  // Set selected to original field when changing weapon type or direction
  const weapon = action.weapons[0];
  useEffect(() => {
    setSelected(`${action.x}-${action.y}`);
  }, [weapon, action.x, action.y, action.direction]);

  let Icon1 = useMemo(() => {
    return itemIcons[action.weapons[0]];
  }, [action.weapons]);
  let Icon2 = useMemo(() => {
    return action.weapons[1] ? itemIcons[action.weapons[1]] : '';
  }, [action.weapons]);

  const onCycleDirection = useCallback(() => {
    const directions: Direction[] = ['up', 'right', 'down', 'left'];
    const current = directions.indexOf(action.direction);
    const nextDirection = directions[(current + 1) % directions.length];
    setAction((a) => ({
      ...a,
      direction: nextDirection,
      hits: getInitialHits(coords, nextDirection, bomb, users, a.weapons[0], segmentsMap, attacksSet),
    }));
  }, [coords, segmentsMap, setAction, action.direction, attacksSet, users, bomb]);

  const isPlayerHit = useCallback(
    (id: number) => {
      return !!action.hits?.find((h) => h.userId === id);
    },
    [action]
  );

  const isPlayerSunk = useCallback(
    (id: number) => {
      return !!action.hits?.find((h) => h.userId === id)?.sunk;
    },
    [action]
  );

  const onToggleHit = useCallback(
    (id: number) => {
      setAction((a) => {
        const next = JSON.parse(JSON.stringify(a)) as BoardAction;
        if (!next.hits) {
          next.hits = [];
        }

        const exists = next.hits?.find((h) => h.userId === id);
        if (exists) {
          next.hits = next.hits.filter((h) => h.userId !== id);
        } else {
          next.hits.push({ userId: id });
        }

        return next;
      });
    },
    [setAction]
  );

  const onSetSunk = useCallback(() => {
    const [x, y] = selected.split('-').map((c) => Number(c));

    const oX = x - action.x || undefined;
    const oY = y - action.y || undefined;

    setAction((a: BoardAction) => {
      let next: BoardAction = JSON.parse(JSON.stringify(a));

      const sunkIndex = next.hits.findIndex((h) => {
        return h.oX === oX && h.oY === oY && currentUser === h.userId;
      });
      if (sunkIndex === -1 && currentUser) {
        next.hits.push({ userId: currentUser, sunk: true, oX, oY });
      } else {
        next.hits[sunkIndex].sunk = !next.hits[sunkIndex].sunk;
      }

      return next;
    });
  }, [action.x, action.y, currentUser, selected, setAction]);

  const onSetHitUser = useCallback(
    (id: number) => {
      if (currentUser === id) {
        setCurrentUser(undefined);
      } else {
        setCurrentUser(id);
      }
    },
    [currentUser]
  );

  const onToggleSunk = useCallback(
    (e: any, id: number) => {
      e.stopPropagation();
      setAction((a) => {
        const next = JSON.parse(JSON.stringify(a)) as BoardAction;
        if (!next.hits) {
          next.hits = [];
        }

        const hitIndex = next.hits?.findIndex((h) => h.userId === id);
        if (hitIndex > -1) {
          next.hits[hitIndex].sunk = !next.hits[hitIndex].sunk;
        } else {
          next.hits.push({ userId: id, sunk: true });
        }

        return next;
      });
    },
    [setAction]
  );

  const isSunk = useCallback(
    (id: number) => {
      const [x, y] = selected.split('-').map((c) => Number(c));

      return !!action.hits.find((hit) => {
        return (x - action.x || undefined) === hit.oX && (y - action.y || undefined) === hit.oY && hit.userId === id;
      })?.sunk;
    },
    [action.hits, action.x, action.y, selected]
  );

  return (
    <>
      <div className="attack-types" style={{ justifyContent: 'center' }}>
        <div className="icon-wrapper">
          <Icon1 style={action.weapons[0] === 'directional' ? { transform: 'rotate(270deg)' } : {}} />
        </div>
        {Icon2 && (
          <>
            <GrAdd />
            <div className="icon-wrapper">
              <Icon2 />
            </div>
          </>
        )}
      </div>

      <br />

      <SetAttackType action={action} setAction={setAction} coords={coords} segmentsMap={segmentsMap} attacksSet={attacksSet} />

      {action.weapons[0] === 'directional' && (
        <Button onClick={onCycleDirection} style={{ marginTop: '15px' }}>
          Rotate
        </Button>
      )}
      {/* Board preview */}
      <Preview action={action} setAction={setAction} selected={selected} setSelected={setSelected} hitUser={currentUser} />

      {/* Users hit */}
      <Header as="h3" style={{ marginBottom: 0 }}>
        Players Hit
      </Header>

      {action.weapons[0] === 'missile' ? (
        <Menu vertical color="green">
          {users.opponents.map((user) => {
            return (
              <Menu.Item className="hit-player" active={isPlayerHit(user.id)} color={'green'} key={user.id} onClick={() => onToggleHit(user.id)}>
                {user.name}
                <Checkbox label="Sunk" checked={isPlayerSunk(user.id)} onClick={(e) => onToggleSunk(e, user.id)} />
              </Menu.Item>
            );
          })}
        </Menu>
      ) : (
        <>
          <br></br>
          {currentUser && <Checkbox label="Sunk" checked={currentUser ? isSunk(currentUser) : false} onClick={onSetSunk}></Checkbox>}
          <Menu vertical color="green">
            {users.opponents.map((user) => {
              return (
                <Menu.Item style={{ justifyContent: 'center' }} className="hit-player" active={user.id === currentUser} color={'green'} key={'select' + user.id} onClick={() => onSetHitUser(user.id)}>
                  {user.name}
                </Menu.Item>
              );
            })}
          </Menu>
        </>
      )}
    </>
  );
};
