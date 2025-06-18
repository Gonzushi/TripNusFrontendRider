import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LogEntry = {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn' | 'success';
};

const MAX_LOGS = 100;
const STORAGE_KEY = 'debug_logs';

export const DebugConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Load previous logs on mount
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setLogs(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored logs', e);
        }
      }
    });

    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
    };

    const addLog = (message: string, type: LogEntry['type']) => {
      setLogs((prevLogs) => {
        const newLogs = [
          ...prevLogs,
          {
            timestamp: new Date().toLocaleTimeString(),
            message:
              typeof message === 'object'
                ? JSON.stringify(message, null, 2)
                : message,
            type,
          },
        ].slice(-MAX_LOGS);

        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));

        // Scroll after short delay to allow render
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        return newLogs;
      });
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog(args.join(' '), 'info');
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog(args.join(' '), 'error');
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog(args.join(' '), 'warn');
    };

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    };
  }, []);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-300';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  return (
    <View
      className="absolute left-0 right-0 top-40 z-50 h-[50vh]"
      pointerEvents="box-none"
      style={{ paddingTop: insets.top }}
    >
      <View
        className="absolute right-0 h-full bg-black/70 px-2 py-1"
        pointerEvents="auto"
      >
        <Pressable className="flex-1">
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator>
            {logs.map((log, index) => (
              <Text
                key={index}
                className={`font-mono text-xs ${getLogColor(log.type)}`}
              >
                [{log.timestamp}] {log.message}
              </Text>
            ))}
          </ScrollView>
        </Pressable>
      </View>
    </View>
  );
};
