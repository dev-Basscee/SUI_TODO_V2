import React, { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useWallets } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check, X, Trash2, AlertTriangle, Wallet } from 'lucide-react';
import { WalletNotInstalledDialog } from '@/components/WalletNotInstalledDialog';

// Environment variables - these should be set in .env
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || 'YOUR_PACKAGE_ID';
const MODULE_NAME = import.meta.env.VITE_MODULE_NAME || 'todo_list';

interface Todo {
  id: number;
  description: string;
  done: boolean;
  cancelled: boolean;
}

const Index = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const wallets = useWallets();
  const { toast } = useToast();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [todoListObjectId, setTodoListObjectId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  // Check for wallet availability and show dialog if needed
  useEffect(() => {
    const checkWallets = () => {
      if (wallets.length === 0) {
        const timer = setTimeout(() => {
          setShowWalletDialog(true);
        }, 1000); // Give time for wallets to load
        return () => clearTimeout(timer);
      }
    };
    checkWallets();
  }, [wallets]);

  // Mock data for demonstration (in real app, fetch from Sui)
  useEffect(() => {
    if (currentAccount) {
      setTodos([
        { id: 0, description: 'Learn Sui blockchain development', done: false, cancelled: false },
        { id: 1, description: 'Build amazing dApps', done: true, cancelled: false },
        { id: 2, description: 'Deploy to mainnet', done: false, cancelled: true },
      ]);
      setTodoListObjectId('0x123...'); // Mock object ID
    }
  }, [currentAccount]);

  const executeTransaction = (tx: Transaction, action: string) => {
    if (!currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      });
      return;
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          toast({
            title: "Transaction successful",
            description: `${action} completed successfully`,
          });
          console.log('Transaction result:', result);
        },
        onError: (error) => {
          toast({
            title: "Transaction failed",
            description: error.message || "Something went wrong",
            variant: "destructive",
          });
          console.error('Transaction error:', error);
        },
      }
    );
  };

  const createTodoList = () => {
    if (!currentAccount) return;
    
    setIsCreatingList(true);
    const tx = new Transaction();
    
    // Create new todo list
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::new`,
      arguments: [],
    });

    executeTransaction(tx, "Todo list creation");
    setIsCreatingList(false);
  };

  const addTodo = () => {
    if (!newTodoDescription.trim() || !todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.string(newTodoDescription),
      ],
    });

    executeTransaction(tx, "Add todo");
    setNewTodoDescription('');
  };

  const markDone = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::mark_done`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Mark todo as done");
  };

  const cancelTodo = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::cancel`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Cancel todo");
  };

  const removeTodo = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::remove`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Remove todo");
  };

  const deleteTodoList = () => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::delete`,
      arguments: [
        tx.object(todoListObjectId),
      ],
    });

    executeTransaction(tx, "Delete todo list");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_hsl(var(--primary))_0%,_transparent_25%)] opacity-[0.03]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_hsl(var(--accent))_0%,_transparent_25%)] opacity-[0.03]"></div>
      
      <div className="relative z-10">
        {/* Floating Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-desert rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-desert bg-clip-text text-transparent">
                    Todo List on sui
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Blockchain-powered task management
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {currentAccount && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-1">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          {!currentAccount ? (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-desert rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-desert">
                  <svg className="w-10 h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4">Welcome to the Future</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Manage your tasks on the Sui blockchain with complete transparency and security
                </p>
              </div>
              
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        All actions require wallet approval for maximum security
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Tasks are permanently recorded on the blockchain
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-muted-foreground mb-6">
                      Connect your Sui wallet to get started with decentralized task management
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !todoListObjectId ? (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-desert rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-desert">
                  <Plus className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Create Your TodoList</h2>
                <p className="text-xl text-muted-foreground">
                  Initialize your personal task list on the Sui blockchain
                </p>
              </div>
              
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <h3 className="font-semibold mb-2">What happens next?</h3>
                      <p className="text-sm text-muted-foreground">
                        Creating a todo list will deploy a new smart contract instance on the Sui blockchain, giving you full ownership and control over your tasks.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={createTodoList}
                    disabled={isCreatingList || isPending}
                    size="lg"
                    className="w-full bg-gradient-desert hover:opacity-90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-desert transition-all duration-300 hover:shadow-xl"
                  >
                    {isCreatingList || isPending ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Creating TodoList...
                      </div>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create TodoList
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {todos.filter(t => t.done).length}
                    </h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Completed
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {todos.filter(t => t.cancelled).length}
                    </h3>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Cancelled
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {todos.filter(t => !t.done && !t.cancelled).length}
                    </h3>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Active
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Add New Todo */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-desert rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Add New Task
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="What needs to be accomplished?"
                        value={newTodoDescription}
                        onChange={(e) => setNewTodoDescription(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                        className="h-12 text-lg bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                    <Button
                      onClick={addTodo}
                      disabled={!newTodoDescription.trim() || isPending}
                      size="lg"
                      className="bg-gradient-desert hover:opacity-90 text-primary-foreground px-8 shadow-desert transition-all duration-300"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                          Adding...
                        </div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Todo List */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-desert rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Your Tasks
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">
                      {todos.length} total
                    </Badge>
                  </CardTitle>
                  {todos.length > 0 && (
                    <Button
                      onClick={deleteTodoList}
                      disabled={isPending}
                      variant="destructive"
                      size="sm"
                      className="bg-destructive hover:bg-destructive/90 shadow-sm"
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full"></div>
                          Deleting...
                        </div>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete List
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {todos.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
                        No tasks yet
                      </h3>
                      <p className="text-muted-foreground">
                        Add your first task above to get started with blockchain-powered task management.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todos.map((todo, index) => (
                        <div
                          key={todo.id}
                          className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                            todo.done 
                              ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-950/20 dark:to-emerald-900/20 dark:border-emerald-800/50' 
                              : todo.cancelled 
                              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800/50'
                              : 'bg-gradient-to-r from-background/80 to-muted/20 border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`text-lg font-medium mb-3 transition-colors ${
                                todo.done ? 'line-through text-emerald-700 dark:text-emerald-300' :
                                todo.cancelled ? 'line-through text-red-700 dark:text-red-300' :
                                'text-foreground'
                              }`}>
                                {todo.description}
                              </p>
                              <div className="flex gap-2">
                                {todo.done && (
                                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                                {todo.cancelled && (
                                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
                                    <X className="w-3 h-3 mr-1" />
                                    Cancelled
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-6 opacity-70 group-hover:opacity-100 transition-opacity">
                              {!todo.done && !todo.cancelled && (
                                <Button
                                  onClick={() => markDone(index)}
                                  disabled={isPending}
                                  size="sm"
                                  variant="outline"
                                  className="h-10 w-10 p-0 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {!todo.done && !todo.cancelled && (
                                <Button
                                  onClick={() => cancelTodo(index)}
                                  disabled={isPending}
                                  size="sm"
                                  variant="outline"
                                  className="h-10 w-10 p-0 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                onClick={() => removeTodo(index)}
                                disabled={isPending}
                                size="sm"
                                variant="outline"
                                className="h-10 w-10 p-0 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      
      {/* Wallet Not Installed Dialog */}
      <WalletNotInstalledDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog} 
      />
    </div>
  );
};

export default Index;