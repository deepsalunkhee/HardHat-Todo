import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import TodoContract from "../../artifacts/contracts/Todo.sol/Todo.json";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setLoading(true);
        setError("");

        const provider = new Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        console.log("Connected address:", address);

        // Initialize contract
        const todoContract = new ethers.Contract(
          contractAddress,
          TodoContract.abi,
          signer
        );

        setContract(todoContract);
        setConnected(true);

        // Fetch todos
        const todoList = await todoContract.getAllTasks();
        setTodos(todoList);
      } catch (error) {
        console.error("Error:", error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install MetaMask and refresh the page."
      );
    }
  };

  const addTodo = async () => {
    if (contract && newTodo) {
      try {
        setLoading(true);
        const tx = await contract.createTask(newTodo);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Ensure the receipt is valid
        if (receipt && typeof receipt.status === "number") {
          if (receipt.status === 1) {
            const updatedTodos = await contract.getAllTasks();
            setTodos(updatedTodos);
            setNewTodo("");
          } else {
            throw new Error("Transaction failed");
          }
        } else {
          throw new Error("Receipt is not in expected format");
        }
      } catch (error) {
        console.error("Error adding todo:", error);
        setError("Failed to add todo. Please try again.");
      } finally {
        setLoading(false);
        //refresh page
        window.location.reload();
      }
    }
  };

  const completeTodo = async (index) => {
    if (contract) {
      try {
        setLoading(true);
        const tx = await contract.toggleTaskCompletion(index);
        const receipt = await tx.wait(); // Wait for the transaction to be mined

        if (receipt && receipt.status === 1) {
          const updatedTodos = await contract.getAllTasks();
          setTodos(updatedTodos);
        } else {
          throw new Error("Transaction failed");
        }
      } catch (error) {
        console.error("Error completing todo:", error);
        setError("Failed to complete todo. Please try again.");
      } finally {
        setLoading(false);
        //refresh page
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ethereum Todo List</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {connected ? (
        <p className="text-green-500 mb-4">Connected to MetaMask</p>
      ) : (
        <p className="text-yellow-500 mb-4">Not connected to MetaMask</p>
      )}
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
        >
          {loading ? "Adding..." : "Add Todo"}
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">Current Todos:</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <span className={todo.completed ? "line-through" : ""}>
                {todo.content}
              </span>
              <button
                onClick={() => completeTodo(todo.id)}
                className="bg-green-500 text-white p-1 rounded text-sm hover:bg-green-600"
              >
                {todo.completed ? "Undo" : "Complete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
