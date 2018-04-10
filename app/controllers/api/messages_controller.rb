class Api::MessagesController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: Message.order(:created_at).limit(30)
  end

  def create
    email = params[:email]
    body = params[:body]
    message = Message.new(email: email, body: body)
    if message.save
      MessageBus.publish "/chat_channel", message.to_json
    # the first param matches what your publishing, second param matches the 
    # not going to render json here, I could but instead ^^^ (reason like "optomistic updates" -> like FB, when you post it shows up imediately, and then if there is an error they notify you later. it appears as if the app is faster.)
    else
      render json: { errors: message.errors.full_messages }, status: 422
    end
  end
end
