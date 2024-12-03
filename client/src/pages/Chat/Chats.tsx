import React, { useState, useEffect, useLayoutEffect, useRef, MouseEvent } from 'react';
import { Container, Box, Typography, CircularProgress, List, ListItem, ListItemText, Avatar, Grid, Paper, TextField, Button, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { getSocket, connectSocket } from '../../socket';
import { format } from 'date-fns';
import { getCookie } from "../../utils/cookies.ts";

interface Chat {
    chatId: string;
    receiverName: string;
    receiverId: string;
    messages: {
        messageId: string;
        chatId: string;
        userId: string;
        text: string;
        createdAt: {
            _seconds: number;
            _nanoseconds: number;
        };
    }[];
}

interface Message {
    messageId: string;
    userId: string;
    text: string;
    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };
    chatId: string;
}

interface User {
    userId: string;
    name: string;
}

const Chats = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; message: Message | null } | null>(null);
    const [editMessageDialog, setEditMessageDialog] = useState<{ open: boolean; message: Message | null }>({ open: false, message: null });
    const [editText, setEditText] = useState('');
    const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
    const [usersWithoutChat, setUsersWithoutChat] = useState<User[]>([]);
    const [temporaryChat, setTemporaryChat] = useState<Chat | null>(null);
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const accessToken = getCookie('accessToken');
        if (!accessToken) {
            setError('Authorization token missing');
            setLoading(false);
            return;
        }

        connectSocket();
        const socket = getSocket();

        if (socket) {
            if (!initialLoadCompleted) {
                socket.emit("message", {
                    event: "get_all_user_chats",
                    message: {}
                });
            }

            socket.on("get_all_user_chats_response", (data: Chat[]) => {
                if (temporaryChat) {
                    const existingChat = data.find(chat => chat.chatId !== temporaryChat.chatId);
                    if (!existingChat) {
                        data.unshift(temporaryChat);
                    }
                    setTemporaryChat(null);
                }
                data.sort((a, b) => {
                    const aLastMessage = a.messages[a.messages.length - 1];
                    const bLastMessage = b.messages[b.messages.length - 1];
                    const aLastTime = aLastMessage ? aLastMessage.createdAt._seconds : 0;
                    const bLastTime = bLastMessage ? bLastMessage.createdAt._seconds : 0;
                    return bLastTime - aLastTime;
                });

                setChats(data);
                setLoading(false);
                setInitialLoadCompleted(true);
                if (data.length > 0) {
                    setSelectedChat(data[0]);
                }
            });

            socket.on("connect_error", () => {
                setError("Error connecting to the server.");
                setLoading(false);
            });

            socket.on("send_message_response", (newMessage: Message) => {
                const { messageId, userId, text, createdAt, chatId } = newMessage;

                const updatedMessage = {
                    messageId,
                    chatId,
                    userId,
                    text,
                    createdAt,
                };

                setChats((prevChats) => {
                    const updatedChats = prevChats.map((chat) =>
                        chat.chatId === chatId
                            ? {
                                ...chat,
                                messages: [...chat.messages, updatedMessage],
                            }
                            : chat
                    );

                    updatedChats.sort((a, b) => {
                        const aLastMessage = a.messages[a.messages.length - 1];
                        const bLastMessage = b.messages[b.messages.length - 1];
                        const aLastTime = aLastMessage ? aLastMessage.createdAt._seconds : 0;
                        const bLastTime = bLastMessage ? bLastMessage.createdAt._seconds : 0;
                        return bLastTime - aLastTime;
                    });

                    return updatedChats;
                });

                if (selectedChat && selectedChat.chatId === chatId) {
                    setSelectedChat((prevChat) => {
                        if (!prevChat) return null;
                        return {
                            ...prevChat,
                            messages: [...prevChat.messages, updatedMessage],
                        };
                    });
                }

                scrollToBottom();
            });

            socket.on("edit_message_response", (data: { messageId: string; chatId: string; text: string }) => {
                const { messageId, chatId, text } = data;

                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.chatId === chatId
                            ? {
                                ...chat,
                                messages: chat.messages.map(message =>
                                    message.messageId === messageId ? { ...message, text } : message
                                ),
                            }
                            : chat
                    )
                );

                if (selectedChat && selectedChat.chatId === chatId) {
                    setSelectedChat((prevChat) => {
                        if (!prevChat) return null;
                        return {
                            ...prevChat,
                            messages: prevChat.messages.map(message =>
                                message.messageId === messageId ? { ...message, text } : message
                            ),
                        };
                    });
                }
            });

            socket.on("delete_message_response", (data: { messageId: string, chatId: string }) => {
                const { messageId, chatId } = data;

                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.chatId === chatId
                            ? {
                                ...chat,
                                messages: chat.messages.filter(message => message.messageId !== messageId),
                            }
                            : chat
                    )
                );

                if (selectedChat && selectedChat.chatId === chatId) {
                    setSelectedChat((prevChat) => {
                        if (!prevChat) return null;
                        return {
                            ...prevChat,
                            messages: prevChat.messages.filter(message => message.messageId !== messageId),
                        };
                    });
                }
            });

            socket.on("new_chat_created", () => {
                socket.emit("message", {
                    event: "get_all_user_chats",
                    message: {}
                });
            });
        }

        return () => {
            if (socket) {
                socket.off("get_all_user_chats_response");
                socket.off("connect_error");
                socket.off("send_message_response");
                socket.off("edit_message_response");
                socket.off("delete_message_response");
                socket.off("new_chat_created");
                socket.disconnect();
            }
        };
    }, [selectedChat, temporaryChat, initialLoadCompleted]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    };

    useLayoutEffect(() => {
        if (selectedChat) {
            scrollToBottom();
        }
    }, [selectedChat]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat) return;

        const socket = getSocket();
        const messagePayload = {
            event: "send_message",
            message: {
                receiverId: selectedChat.receiverId,
                text: newMessage,
            },
        };

        if (socket) {
            socket.emit("message", messagePayload);
        }

        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleContextMenu = (event: MouseEvent, message: Message) => {
        event.preventDefault();
        if (message.userId === userId) {
            setContextMenu(
                contextMenu === null
                    ? {
                        mouseX: event.clientX - 2,
                        mouseY: event.clientY - 4,
                        message,
                    }
                    : null,
            );
        }
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleDeleteMessage = () => {
        if (contextMenu && contextMenu.message) {
            const socket = getSocket();
            const messagePayload = {
                event: "delete_message",
                message: {
                    chatId: selectedChat?.chatId,
                    messageId: contextMenu.message.messageId,
                    receiverId: selectedChat?.receiverId,
                },
            };

            if (socket) {
                socket.emit("message", messagePayload);
            }

            handleCloseContextMenu();
        }
    };

    const handleEditMessageOpen = () => {
        if (contextMenu && contextMenu.message) {
            setEditMessageDialog({ open: true, message: contextMenu.message });
            setEditText(contextMenu.message.text);
            handleCloseContextMenu();
        }
    };

    const handleEditMessageClose = () => {
        setEditMessageDialog({ open: false, message: null });
        setEditText('');
    };

    const handleEditMessageSubmit = () => {
        if (editMessageDialog.message) {
            const socket = getSocket();
            const messagePayload = {
                event: "edit_message",
                message: {
                    chatId: editMessageDialog.message.chatId,
                    messageId: editMessageDialog.message.messageId,
                    receiverId: selectedChat?.receiverId,
                    text: editText,
                },
            };

            if (socket) {
                socket.emit("message", messagePayload);
            }

            handleEditMessageClose();
        }
    };

    const handleEditMessageKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditMessageSubmit();
        }
    };

    const handleNewChatOpen = () => {
        setNewChatDialogOpen(true);
        const socket = getSocket();

        if (socket) {
            socket.emit("message", { event: "get_all_users_without_chat" });

            socket.on("get_all_users_without_chat_response", (users: User[]) => {
                setUsersWithoutChat(users);
                socket.off("get_all_users_without_chat_response");
            });
        }
    };

    const handleNewChatClose = () => {
        setNewChatDialogOpen(false);
    };

    const handleCreateNewChat = (user: User) => {
        const newChat: Chat = {
            chatId: `temp-${user.userId}`,
            receiverName: user.name,
            receiverId: user.userId,
            messages: [],
        };

        setChats((prevChats) => [newChat, ...prevChats]);
        setTemporaryChat(newChat);
        setSelectedChat(newChat);
        handleNewChatClose();
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ textAlign: 'center', marginTop: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ textAlign: 'center', marginTop: 8 }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                height: '100vh',
                marginTop: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
            }}
        >
            <Grid container spacing={0} sx={{ flexGrow: 1, height: '100%' }}>
                <Grid
                    item
                    xs={4}
                    sx={{
                        height: '100%',
                        overflowY: 'auto',
                        borderRight: '1px solid #ccc',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }}
                >
                    <Paper sx={{ height: '100%' }}>
                        <Box sx={{ padding: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                List of chats
                            </Typography>
                            <Button variant="contained" color="primary" onClick={handleNewChatOpen} fullWidth sx={{ mb: 2 }}>
                                New chat
                            </Button>
                            <List>
                                {chats.map((chat) => (
                                    <ListItem
                                        key={chat.chatId}
                                        component="li"
                                        onClick={() => setSelectedChat(chat)}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                            },
                                            backgroundColor: selectedChat?.chatId === chat.chatId ? '#1976d2' : 'inherit',
                                            color: selectedChat?.chatId === chat.chatId ? '#ffffff' : 'inherit',
                                        }}
                                    >
                                        <Avatar sx={{ marginRight: 2 }}>
                                            {chat.receiverName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <ListItemText
                                            primary={chat.receiverName}
                                            secondary={chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "No messages"}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>

                <Grid
                    item
                    xs={8}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <Paper
                        sx={{
                            flexGrow: 1,
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        {selectedChat ? (
                            <>
                                <Typography variant="h5" gutterBottom>
                                    Chat with: {selectedChat.receiverName}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflowY: 'auto',
                                        flexGrow: 1,
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                    }}
                                >
                                    {selectedChat.messages.map((message) => (
                                        <Box
                                            key={message.messageId}
                                            onContextMenu={(event) => handleContextMenu(event, message)}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.userId === userId ? 'flex-end' : 'flex-start',
                                                marginBottom: 2,
                                                cursor: message.userId === userId ? 'text' : 'default',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    maxWidth: '70%',
                                                    padding: 1,
                                                    borderRadius: 2,
                                                    backgroundColor: message.userId === userId ? '#1976d2' : '#f0f0f0',
                                                    color: message.userId === userId ? '#fff' : '#000',
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    {message.text}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={message.userId === userId ? '#ffffff' : '#6e6e6e'}
                                                    sx={{ marginTop: 0.5 }}
                                                >
                                                    {format(new Date(message.createdAt._seconds * 1000), 'dd.MM.yy, HH:mm')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h6" color="textSecondary">
                                    There are no chats. Click the New Chat button
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {selectedChat && (
                        <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
                            <TextField
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyUp={handleKeyPress}
                                placeholder="Enter message..."
                                fullWidth
                                variant="outlined"
                                sx={{ marginRight: 2 }}
                            />
                            <Button variant="contained" color="primary" onClick={handleSendMessage}>
                                Send
                            </Button>
                        </Box>
                    )}
                </Grid>
            </Grid>

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleEditMessageOpen}>Edit</MenuItem>
                <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
            </Menu>

            <Dialog open={editMessageDialog.open} onClose={handleEditMessageClose}>
                <DialogTitle>Edit message</DialogTitle>
                <DialogContent>
                    <TextField
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        margin="dense"
                        label="Message"
                        fullWidth
                        variant="outlined"
                        onKeyUp={handleEditMessageKeyPress}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditMessageClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleEditMessageSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={newChatDialogOpen} onClose={handleNewChatClose}>
                <DialogTitle>New chat</DialogTitle>
                <DialogContent>
                    {usersWithoutChat.length === 0 ? (
                        <Typography variant="body1" gutterBottom>
                            There are no users available to create a new chat.
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Select a user to create a new chat.
                            </Typography>
                            <List>
                                {usersWithoutChat.map((user) => (
                                    <ListItem
                                        key={user.userId}
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => handleCreateNewChat(user)}
                                    >
                                        <Avatar sx={{ marginRight: 2 }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <ListItemText primary={user.name} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewChatClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Chats;
