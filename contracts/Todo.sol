pragma solidity ^0.8.0;

contract Todo {
    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;
    uint256 public taskCount;

    event TaskCreated(uint256 id, string content, bool completed);
    event TaskCompleted(uint256 id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleTaskCompletion(uint256 _id) public {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }

    function getTask(uint256 _id) public view returns (Task memory) {
        require(_id > 0 && _id <= taskCount, "Invalid task ID");
        return tasks[_id];
    }

    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskCount);
        for (uint256 i = 1; i <= taskCount; i++) {
            allTasks[i - 1] = tasks[i];
        }
        return allTasks;
    }
}
