require 'rubygems'
require 'sinatra'

get '/add/:domain' do |domain|
	puts "Adding #{domain}"
end

get '/delete/:domain' do |domain|
	puts "Deleting #{domain}"
end