//
//  CampfireApp.swift
//  Campfire
//

import SwiftUI
import Supabase

@main
struct CampfireApp: App {
    let client = SupabaseClient(supabaseURL: URL(string: "https://xyzcompany.supabase.co")!, supabaseKey: "public-anon-key")

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
