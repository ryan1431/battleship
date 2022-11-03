import { Header, Menu } from 'semantic-ui-react';
import { useAppSelector } from '../app/hooks';
import './Upgrades.css';

export const Upgrades = () => {
  const upgrades = useAppSelector((s) => s.settings.upgrades);
  const levels = useAppSelector((s) => s.game.levels);

  return (
    <div className="upgrade-wrapper">
      <div className="upgrades">
        <Header as="h3">Ship (Level {levels.ship})</Header>
        <Menu size="mini" vertical fluid>
          {upgrades.ship.map((ship, i) => {
            return (
              <Menu.Item active={i === levels.ship} key={i}>
                <strong>Level {i}</strong>
                <br />
                <span style={{ fontSize: '10px' }}>
                  Ship Segments purchaseable for <strong>${ship.segmentCost.toFixed(0)}</strong>
                </span>
                <br />
                <br />
                <strong>Cost: ${ship.cost}</strong>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
      <div className="upgrades">
        <Header as="h3">Pillage (Level {levels.pillage})</Header>
        <Menu size="mini" vertical fluid>
          {upgrades.pillage.map((pillage, i) => {
            return (
              <Menu.Item active={i === levels.pillage} key={i}>
                <strong>Level {i}</strong>
                <br />
                <span style={{ fontSize: '10px' }}>
                  <strong>${pillage.earningsPerSegment}</strong> per segment killed, <strong>{pillage.segmentRewardOnSink}</strong> segment per sunk ship
                </span>
                <br />
                <br />
                <strong>Cost: ${pillage.cost}</strong>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
      <div className="upgrades">
        <Header as="h3">Movement (Level {levels.movement})</Header>
        <Menu size="mini" vertical fluid>
          {upgrades.move.map((movement, i) => {
            return (
              <Menu.Item active={i === levels.pillage} key={i}>
                <strong>Level {i}</strong>
                <br />
                <span style={{ fontSize: '10px' }}>Expands board 1 additional square</span>
                <br />
                <br />
                <strong>Cost: ${movement.cost}</strong>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
      <div className="upgrades">
        <Header as="h3">Range (Level {levels.range})</Header>
        <Menu size="mini" vertical fluid>
          {upgrades.range.map((range, i) => {
            return (
              <Menu.Item active={i === levels.pillage} key={i}>
                <strong>Level {i}</strong>
                <br />
                <span style={{ fontSize: '10px' }}>Ship can shoot {range.attackRange} squares away</span>
                <br />
                <br />
                <strong>Cost: ${range.cost}</strong>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
    </div>
  );
};
