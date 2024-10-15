

async function main() {
    const Todo = await ethers.getContractFactory("Todo"); // Replace "Todo" with your contract name
    const todo = await Todo.deploy();

    await todo.deployed(); // This waits for the deployment to be mined

    console.log("Todo contract deployed to:", todo.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

