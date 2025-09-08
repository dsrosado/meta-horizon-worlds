import { Component, PropTypes, World, Vec3, Player, Quaternion } from 'horizon/core';

export class FollowPlayer extends Component<typeof FollowPlayer> {
  static propsDefinition = {
    speed: { type: PropTypes.Number, default: 2 },
  };

  override start() {
    // Connect to the world's update loop to check player positions every frame.
    this.connectLocalBroadcastEvent(World.onUpdate, (data) => {
      this.updateMovement(data.deltaTime);
    });
  }

  private updateMovement(deltaTime: number) {
    const players = this.world.getPlayers();
    if (players.length === 0) {
      return; // No players to follow
    }

    const myPosition = this.entity.position.get();
    let closestPlayer: Player | null = null;
    let minDistanceSq = Infinity;

    // Find the closest player by comparing squared distances (more efficient than sqrt)
    for (const player of players) {
      const distanceSq = myPosition.distanceSquared(player.position.get());
      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        closestPlayer = player;
      }
    }

    if (closestPlayer) {
      const targetPosition = closestPlayer.position.get();
      
      // Create a direction vector towards the player, but ignore the Y-axis for horizontal movement.
      const direction = new Vec3(
        targetPosition.x - myPosition.x,
        0, // Keep Y constant
        targetPosition.z - myPosition.z
      ).normalize();

      // Calculate the movement for this frame.
      const moveStep = direction.mul(this.props.speed * deltaTime);
      const newPosition = myPosition.add(moveStep);
      
      // Apply the new position.
      this.entity.position.set(newPosition);

      // Make the entity face the direction of movement.
      if (direction.magnitudeSquared() > 0.01) {
        this.entity.rotation.set(Quaternion.lookRotation(direction));
      }
    }
  }
}

Component.register(FollowPlayer);
