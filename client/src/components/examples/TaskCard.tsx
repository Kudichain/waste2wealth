import { TaskCard } from "../TaskCard";

export default function TaskCardExample() {
  const sampleTask = {
    id: "1",
    type: "plastic" as const,
    weight: 15,
    reward: 150,
    location: "Kano Municipal Market",
    distance: "1.2 km",
    verified: true
  };

  return (
    <div className="p-6 max-w-sm">
      <TaskCard 
        task={sampleTask}
        onAccept={(id) => console.log('Accept task:', id)}
        onNavigate={(id) => console.log('Navigate to task:', id)}
      />
    </div>
  );
}
